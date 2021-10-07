export interface ScalarShape {
    kind: 'scalar';
    name: 'null' | 'string' | 'number' | 'boolean' | 'bigint';
}
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
export declare type Shape = ArrayShape | ObjectShape | VariedShape | ScalarShape | {
    kind: 'unknown';
};
export declare function levelPrefix(level: number): string;
export declare function toString(shape: Shape, level?: number): string;
export declare function shape(data: any, sampleSizeMax?: number): Shape;
