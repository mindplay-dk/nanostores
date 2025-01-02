import { atom } from '../atom/index'
import { computed } from '../computed/index'
import { onMount } from '../lifecycle/index'

export function branch($control, branches) {
  const store = atom()
  
  onMount(store, () => {
    return $control.subscribe(control => {
      let branchUnsubscribe = null
      
      const branchFn = branches[control]
      if (branchFn) {
        const branchStore = branchFn()
        branchUnsubscribe = branchStore.subscribe(value => {
          store.set(value)
        })
      } else {
        console.warn(`No branch defined for value: ${control}`)
      }
      
      return () => {
        if (branchUnsubscribe) {
          branchUnsubscribe()
        }
      }
    })
  })
  
  return store
}