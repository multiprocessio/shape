const fs = require('fs');
const { toString, shape } = require('./shape');

const shapeString = (a) => toString(shape(a));

test('shape', () => {
  expect(shapeString('foo')).toBe('string');

  expect(shapeString({ b: 'cat', c: true })).toBe(
    "Object with\n  'b' of\n    string,\n  'c' of\n    boolean"
  );

  expect(shapeString(['foo'])).toBe('Array of\n  string');

  expect(shapeString(['foo', 1])).toBe('Array of\n  string or\n  number');

  expect(
    shapeString([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ])
  ).toBe(
    "Array of\n  Object with\n    'a' of\n      number,\n    'b' of\n      number"
  );

  expect(
    shapeString([
      { a: 1, b: 2 },
      { a: 3, b: null, c: 'hey' },
    ])
  ).toBe(
    "Array of\n  Object with\n    'a' of\n      number,\n    'b' of\n      number or\n      null,\n    'c' of\n      string or\n      null"
  );

  expect(
    shapeString([
      [1, 2],
      ['x', 'y'],
    ])
  ).toBe('Array of\n  Array of\n    number or\n    string');

  expect(shapeString([1, ['x', 'y']])).toBe(
    'Array of\n  number or\n  Array of\n    string'
  );

  expect(
    shapeString({
      results: [
        { name: 'Kevin', score: '1' },
        { name: 'Moira', score: 1 },
        { name: 'Alexei', score: 2 },
        { name: 'Tia', score: 2, admin: true },
      ],
      pageSize: 5,
      total: 100,
      nextPage: 'https://myapi.com/p=2',
    })
  ).toBe(
    "Object with\n  'results' of\n    Array of\n      Object with\n        'name' of\n          string,\n        'score' of\n          string or\n          number,\n        'admin' of\n          boolean or\n          null,\n  'pageSize' of\n    number,\n  'total' of\n    number,\n  'nextPage' of\n    string"
  );
});

test('basic nested objects to shape-ify correctly', () => {
  const identicalObjects = [{ a: { b: 1 } }, { a: { b: 1 } }];
  expect(shape(identicalObjects)).toStrictEqual({
    kind: 'array',
    children: {
      kind: 'object',
      children: {
        a: {
          kind: 'object',
          children: {
            b: {
              kind: 'scalar',
              name: 'number',
            },
          },
        },
      },
    },
  });

  const unidenticalObjects = [
    { a: { b: 1, d: 22 } },
    { a: { c: 'street', d: 80 } },
  ];
  expect(shape(unidenticalObjects)).toStrictEqual({
    kind: 'array',
    children: {
      kind: 'object',
      children: {
        a: {
          kind: 'object',
          children: {
            b: {
              kind: 'varied',
              children: [
                {
                  kind: 'scalar',
                  name: 'number',
                },
                {
                  kind: 'scalar',
                  name: 'null',
                },
              ],
            },
            d: {
              kind: 'scalar',
              name: 'number',
            },
            c: {
              kind: 'varied',
              children: [
                {
                  kind: 'scalar',
                  name: 'string',
                },
                {
                  kind: 'scalar',
                  name: 'null',
                },
              ],
            },
          },
        },
      },
    },
  });
});

test('elasticlogs', () => {
  const logs = JSON.parse(fs.readFileSync('./data/logs').toString());
  expect(shape(logs)).toStrictEqual({
    kind: 'array',
    children: {
      kind: 'object',
      children: {
        _index: {
          kind: 'scalar',
          name: 'string',
        },
        _type: {
          kind: 'scalar',
          name: 'string',
        },
        _id: {
          kind: 'scalar',
          name: 'string',
        },
        _score: {
          kind: 'scalar',
          name: 'null',
        },
        _source: {
          kind: 'object',
          children: {
            '@timestamp': {
              kind: 'scalar',
              name: 'string',
            },
            syslog: {
              kind: 'object',
              children: {
                facility: {
                  kind: 'scalar',
                  name: 'number',
                },
                identifier: {
                  kind: 'scalar',
                  name: 'string',
                },
                priority: {
                  kind: 'scalar',
                  name: 'number',
                },
              },
            },
            journald: {
              kind: 'object',
              children: {
                host: {
                  kind: 'object',
                  children: {
                    boot_id: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                uid: {
                  kind: 'scalar',
                  name: 'number',
                },
                pid: {
                  kind: 'scalar',
                  name: 'number',
                },
                custom: {
                  kind: 'object',
                  children: {
                    tid: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                    user_id: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                    selinux_context: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    session_id: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                    stream_id: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                    leader: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                    message_id: {
                      kind: 'varied',
                      children: [
                        {
                          kind: 'scalar',
                          name: 'string',
                        },
                        {
                          kind: 'scalar',
                          name: 'null',
                        },
                      ],
                    },
                  },
                },
                code: {
                  kind: 'varied',
                  children: [
                    {
                      kind: 'object',
                      children: {
                        line: {
                          kind: 'scalar',
                          name: 'number',
                        },
                        file: {
                          kind: 'scalar',
                          name: 'string',
                        },
                        func: {
                          kind: 'scalar',
                          name: 'string',
                        },
                      },
                    },
                    {
                      kind: 'scalar',
                      name: 'null',
                    },
                  ],
                },
                process: {
                  kind: 'object',
                  children: {
                    command_line: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    name: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    capabilites: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    executable: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                gid: {
                  kind: 'scalar',
                  name: 'number',
                },
              },
            },
            message: {
              kind: 'scalar',
              name: 'string',
            },
            host: {
              kind: 'object',
              children: {
                architecture: {
                  kind: 'scalar',
                  name: 'string',
                },
                id: {
                  kind: 'scalar',
                  name: 'string',
                },
                hostname: {
                  kind: 'scalar',
                  name: 'string',
                },
                name: {
                  kind: 'scalar',
                  name: 'string',
                },
                os: {
                  kind: 'object',
                  children: {
                    platform: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    version: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    family: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    name: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    kernel: {
                      kind: 'scalar',
                      name: 'string',
                    },
                    type: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                containerized: {
                  kind: 'scalar',
                  name: 'boolean',
                },
                ip: {
                  kind: 'array',
                  children: { kind: 'scalar', name: 'string' },
                },
                mac: {
                  kind: 'array',
                  children: { kind: 'scalar', name: 'string' },
                },
              },
            },
            user: {
              kind: 'object',
              children: {
                group: {
                  kind: 'object',
                  children: {
                    id: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                id: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            systemd: {
              kind: 'object',
              children: {
                invocation_id: {
                  kind: 'scalar',
                  name: 'string',
                },
                transport: {
                  kind: 'scalar',
                  name: 'string',
                },
                slice: {
                  kind: 'scalar',
                  name: 'string',
                },
                cgroup: {
                  kind: 'scalar',
                  name: 'string',
                },
                unit: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            process: {
              kind: 'object',
              children: {
                args: {
                  kind: 'array',
                  children: { kind: 'scalar', name: 'string' },
                },
                args_count: {
                  kind: 'scalar',
                  name: 'number',
                },
                pid: {
                  kind: 'scalar',
                  name: 'number',
                },
                command_line: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            event: {
              kind: 'object',
              children: {
                kind: {
                  kind: 'scalar',
                  name: 'string',
                },
                created: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            log: {
              kind: 'object',
              children: {
                syslog: {
                  kind: 'object',
                  children: {
                    priority: {
                      kind: 'scalar',
                      name: 'number',
                    },
                    facility: {
                      kind: 'object',
                      children: {
                        name: {
                          kind: 'scalar',
                          name: 'number',
                        },
                      },
                    },
                  },
                },
              },
            },
            agent: {
              kind: 'object',
              children: {
                type: {
                  kind: 'scalar',
                  name: 'string',
                },
                version: {
                  kind: 'scalar',
                  name: 'string',
                },
                hostname: {
                  kind: 'scalar',
                  name: 'string',
                },
                ephemeral_id: {
                  kind: 'scalar',
                  name: 'string',
                },
                id: {
                  kind: 'scalar',
                  name: 'string',
                },
                name: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            ecs: {
              kind: 'object',
              children: {
                version: {
                  kind: 'scalar',
                  name: 'string',
                },
              },
            },
            cloud: {
              kind: 'object',
              children: {
                instance: {
                  kind: 'object',
                  children: {
                    id: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                machine: {
                  kind: 'object',
                  children: {
                    type: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                provider: {
                  kind: 'scalar',
                  name: 'string',
                },
                region: {
                  kind: 'scalar',
                  name: 'string',
                },
                availability_zone: {
                  kind: 'scalar',
                  name: 'string',
                },
                service: {
                  kind: 'object',
                  children: {
                    name: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                account: {
                  kind: 'object',
                  children: {
                    id: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
                image: {
                  kind: 'object',
                  children: {
                    id: {
                      kind: 'scalar',
                      name: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        sort: {
          kind: 'array',
          children: {
            kind: 'scalar',
            name: 'number',
          },
        },
      },
    },
  });
});
