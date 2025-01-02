import { atom } from '../atom/index'
import { onMount } from '../lifecycle/index'

const throwError = (control) => { throw new Error(`Undefined branch: ${control}`) }

export function fork($control, getStore) {
  const $store = atom()
  
  onMount($store, () => {
    let unsubscribeFromLastStore = () => {}

    const switchStore = (control) => {
      unsubscribeFromLastStore()
      unsubscribeFromLastStore = () => {}

      let _unsubscribeFromBranch = getStore(control).subscribe(value => {
        console.log('--- publish',value,'for branch',control); // TODO clean up
        $store.set(value)
      })

      unsubscribeFromLastStore = () => {
        console.log('--- unsub from branch:',control); // TODO clean up
        _unsubscribeFromBranch()
      }
    }

    const unsubscribeFromControl = $control.subscribe(switchStore)

    return () => {
      unsubscribeFromLastStore()
      unsubscribeFromControl()
    }
  })
  
  return $store
}

export function branch($control, branches, fallback = throwError) {
  return fork($control, (control) => {
    const branch = branches[control] || fallback

    return branch(control);
  })
}
