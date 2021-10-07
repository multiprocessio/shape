function deepEquals(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function deepClone(a: any) {
  return JSON.parse(JSON.stringify(a));
}

export interface ScalarShape {
  kind: 'scalar';
  name: 'null' | 'string' | 'number' | 'boolean' | 'bigint';
}

const NULL_SHAPE: ScalarShape = { kind: 'scalar', name: 'null' };

export interface ObjectShape {
  kind: 'object';
  children: Record<string, Shape>;
}

export interface ArrayShape {
  kind: 'array';
  children: Shape;
}

export interface VariedShape {
  kind: 'varied';
  children: Shape[];
}

export type Shape =
  | ArrayShape
  | ObjectShape
  | VariedShape
  | ScalarShape
  | {
      kind: 'unknown';
    };

export function levelPrefix(level: number) {
  return [...Array(level * 2).keys()].map((c) => ' ').join('');
}

export function toString(shape: Shape, level = 0): string {
  switch (shape.kind) {
    case 'scalar':
      return levelPrefix(level) + shape.name;
    case 'array':
      return (
        levelPrefix(level) + 'Array of\n' + toString(shape.children, level + 1)
      );
    case 'object': {
      const keys = Object.keys(shape.children);
      return (
        levelPrefix(level) +
        ('Object ' +
          (keys.length
            ? 'with\n' +
              keys
                .map(
                  (k) =>
                    `${levelPrefix(level + 1)}'${k}' of\n${toString(
                      shape.children[k],
                      level + 2
                    )}`
                )
                .join(',\n')
            : '(empty)'))
      );
    }
    case 'varied':
      return shape.children.map((c) => toString(c, level)).join(' or\n');
    case 'unknown':
      return levelPrefix(level) + 'Unknown';
  }
}

function walkVaried(varied: VariedShape, cb: (a0: Shape) => boolean | void) {
  const stack: Array<Shape> = [varied];
  while (stack.length) {
    const top = stack.pop();
    if (top.kind === 'varied') {
      top.children.map((c) => stack.push(c));
    }

    if (cb(top)) {
      break;
    }
  }
}

function addUniqueVaried(maybeVaried: Shape, shape: Shape) {
  if (
    !maybeVaried ||
    (maybeVaried.kind === 'varied' &&
      (!maybeVaried.children || !maybeVaried.children.length))
  ) {
    return shape;
  }

  if (maybeVaried.kind === 'varied') {
    const varied: VariedShape = maybeVaried;

    let found = false;
    walkVaried(varied, (child: Shape) => {
      // Don't try to use variedMerge here, it doesn't recurse correctly.
      if (shape.kind === 'varied') {
        walkVaried(shape, (toAddChild: Shape) => {
          if (deepEquals(child, toAddChild)) {
            found = true;
            return true;
          }
        });

        if (found) {
          return true;
        }
      }

      //console.log('attempting to add ', shape, 'comparing to ', child, 'is equal?', deepEquals(child, shape));
      if (deepEquals(child, shape)) {
        found = true;
        return true;
      }
    });

    // Don't add the same shape twice
    if (found) {
      return varied;
    }
  }

  const result: VariedShape = {
    kind: 'varied',
    children: [maybeVaried, shape],
  };
  return result;
}

function variedMerge(a: VariedShape, b: VariedShape): VariedShape {
  let varied: VariedShape = { kind: 'varied', children: [] };
  for (const side of [a, b]) {
    walkVaried(side, (child) => {
      varied = addUniqueVaried(varied, child) as VariedShape;
    });
  }

  return varied;
}

function objectMerge(a: ObjectShape, b: ObjectShape): ObjectShape {
  const aKeys = Object.keys(a.children);
  const bKeys = Object.keys(b.children);
  const merged: ObjectShape = {
    kind: 'object',
    children: {},
  };

  // First check all aKeys to see if they differ in b
  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i];
    if (bKeys.includes(key)) {
      merged.children[key] = merge([a.children[key], b.children[key]]).children;
      continue;
    }

    // If they are new, they must sometimes be null/undefined
    merged.children[key] = addUniqueVaried(a.children[key], NULL_SHAPE);
  }

  // now check all bKeys to see if they are new to a
  for (let i = 0; i < bKeys.length; i++) {
    const key = bKeys[i];
    if (!aKeys.includes(key)) {
      // If they are new, they must sometimes be null/undefined
      merged.children[key] = addUniqueVaried(b.children[key], NULL_SHAPE);
      continue;
    }

    // Do nothing, it's already been merged.
  }

  return merged;
}

function getNRandomUniqueElements(arraySize: number, maxSampleSize: number) {
  if (!maxSampleSize || arraySize <= maxSampleSize) {
    return [...Array(arraySize).keys()].map((_, i) => i);
  }

  const unique = [];
  while (unique.length < maxSampleSize) {
    const random = Math.floor(Math.random() * (arraySize - 1)) + 1;
    if (unique.indexOf(random) === -1) {
      unique.push(random);
    }
  }

  return unique;
}

export function merge(
  shapes: Array<Shape>,
  sampleSizeMax?: number
): ArrayShape {
  const merged: ArrayShape = { kind: 'array', children: { kind: 'unknown' } };
  if (!shapes.length) {
    return merged;
  }

  const randomUniqueIndexes = getNRandomUniqueElements(
    shapes.length,
    sampleSizeMax || shapes.length
  );

  merged.children = shapes[0];
  for (let i = 0; i < randomUniqueIndexes.length; i++) {
    const shape = shapes[randomUniqueIndexes[i]];
    if (deepEquals(merged.children, shape)) {
      continue;
    }

    if (shape.kind === 'object' && merged.children.kind === 'object') {
      merged.children = objectMerge(deepClone(merged.children), shape);
      continue;
    }

    if (shape.kind === 'array' && merged.children.kind === 'array') {
      merged.children = merge([
        deepClone(merged.children).children,
        shape.children,
      ]);
      continue;
    }

    // It's possible this case isn't even possible since 'varied' is
    // something that only gets applied during post-processing here.
    if (shape.kind === 'varied' && merged.children.kind === 'varied') {
      merged.children = variedMerge(
        shape as VariedShape,
        deepClone(merged.children) as VariedShape
      );
      continue;
    }

    if (shape.kind === merged.children.kind && shape.kind !== 'scalar') {
      throw new Error(
        `Missing type equality condition for ${shape.kind} merge.`
      );
    }

    merged.children = addUniqueVaried(merged.children, shape);
  }

  return merged;
}

function shapeOfArray(data: any[], sampleSizeMax: number) {
  const shapes = data.map((d) => shape(d, sampleSizeMax));
  return merge(shapes, sampleSizeMax);
}

function shapeOfObject(
  data: Record<string, any>,
  sampleSizeMax: number
): Shape {
  const keys = Object.keys(data);

  const randomUniqueIndexes = getNRandomUniqueElements(
    keys.length,
    sampleSizeMax
  );

  const os: ObjectShape = { kind: 'object', children: {} };
  for (let i = 0; i < randomUniqueIndexes.length; i++) {
    const key = keys[randomUniqueIndexes[i]];
    os.children[key] = shape(data[key], sampleSizeMax);
  }

  return os;
}

export function shape(data: any, sampleSizeMax = 5000): Shape {
  try {
    if (Array.isArray(data)) {
      return shapeOfArray(data as any[], sampleSizeMax);
    }

    if (data === null) {
      return { kind: 'scalar', name: 'null' };
    }

    if (typeof data === 'object') {
      return shapeOfObject(data, sampleSizeMax);
    }

    if (typeof data === 'number') {
      return { kind: 'scalar', name: 'number' };
    }

    if (typeof data === 'bigint') {
      return { kind: 'scalar', name: 'bigint' };
    }

    if (typeof data === 'undefined') {
      return { kind: 'scalar', name: 'null' };
    }

    if (typeof data === 'boolean') {
      return { kind: 'scalar', name: 'boolean' };
    }

    return { kind: 'scalar', name: 'string' };
  } catch (e) {
    console.error(e);
    return { kind: 'unknown' };
  }
}
