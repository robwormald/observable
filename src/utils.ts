export const nonenumerable = (target, key, descriptor) => descriptor.enumerable = false;

export function cleanupFromSubscription(subscription){
	return () => subscription.unsubscribe();
}

export function subscriptionClosed(subscription) {
  return subscription._observer === undefined;
}

export function cleanupSubscription(subscription){
  let cleanup = subscription._cleanup;
  if(!cleanup){
    return;
  }
  subscription._cleanup = undefined;
  cleanup();
}

export function closeSubscription(subscription) {
  if (subscriptionClosed(subscription)){
    return;
  }
  subscription._observer = undefined;
  cleanupSubscription(subscription);
}
