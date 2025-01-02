import { deepStrictEqual, equal, throws } from 'node:assert'
import { test } from 'node:test'

import {
  branch,
  atom,
  batched,
  computed,
  deepMap,
  map,
  onMount,
  onSet,
  STORE_UNMOUNT_DELAY,
  type StoreValue,
  task
} from '../index.js'

test('can branch between stores', () => {
  let log: string[] = []

  const verify = (expected: string[]) => {
    deepStrictEqual(log, expected)
    log = []
  }

  const $a = atom('A')
  const $b = atom('B')
  const $c = atom('C')
  const $control = atom('a')

  const $branch = branch($control, {
    a: () => {
      log.push('setup:a')
      return computed([$a, $c], (a, c) => {
        log.push('compute:a')
        return a + c
      })
    },
    b: () => {
      log.push('setup:b')
      return computed([$b, $c], (b, c) => {
        log.push('compute:b')
        return b + c
      })
    },
  })

  let unsubscribe = $branch.subscribe(value => {
    log.push('branch:' + value)
  })

  verify([
    'setup:a',
    'compute:a',
    'branch:AC',
  ])

  equal($branch.get(), 'AC')

  $control.set('b')

  equal($branch.get(), 'BC')

  verify([
    'setup:b',
    'compute:b',
    'branch:BC',
  ])

  $c.set('CC');

  equal($branch.get(), 'BCC')

  verify([
    'compute:a', // TODO this is a bug! branch `a` isn't active and shouldn't be running
    'compute:b',
    'branch:BCC'
  ]);

  $b.set('BB');

  equal($branch.get(), 'BBCC')

  verify([
    'compute:b',
    'branch:BBCC'
  ]);

  $a.set('AA');

  equal($branch.get(), 'BBCC')

  verify([
    'compute:a', // TODO this is a bug! branch `a` isn't active and shouldn't be running
  ]);

  throws(
    () => { $control.set('oops') },
    /Undefined branch: oops/,
    "the default fallback branch should throw an Error"
  );

  unsubscribe()
})
