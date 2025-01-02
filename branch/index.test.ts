import { deepStrictEqual, equal, ok } from 'node:assert'
import { test } from 'node:test'

import {
  branch,
  atom,
  batched,
  computed,
  deepMap,
  map,
  onMount,
  STORE_UNMOUNT_DELAY,
  type StoreValue,
  task
} from '../index.js'

test('can branch between stores', () => {
  let log: string[] = []

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

  equal($branch.get(), 'AC')

  $control.set('b')

  equal($branch.get(), 'BC')

  deepStrictEqual(log, [
    'setup:a',
    'compute:a',
    'branch:AC',
    'setup:b',
    'compute:b',
    'branch:BC',
  ])

  unsubscribe()
})
