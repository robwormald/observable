import {SubscriptionObserver} from './SubscriptionObserver'
import {nonenumerable} from './utils'

function cleanupFromSubscription(subscription){
	return () => subscription.unsubscribe();
}

function subscriptionClosed(subscription) {
  return subscription._observer === undefined;
}

function cleanupSubscription(subscription){
  let cleanup = subscription._cleanup;
  if(!cleanup){
    return;
  }
  subscription._cleanup = undefined;
  cleanup();
}

function closeSubscription(subscription) {
  if (subscriptionClosed(subscription)){
    return;
  }
  subscription._observer = undefined;
  cleanupSubscription(subscription);
}

export class Subscription {
	private _cleanup:any;
	constructor(public _observer, private _subscriber){
		if(Object(_observer) !== _observer){
			throw new TypeError('Observer must be an object');
		}

		_observer = new SubscriptionObserver(this);

		try {
			let cleanup = _subscriber.call(undefined, _observer);

			if(cleanup != null){
				if(typeof cleanup.unsubscribe === 'function'){
					cleanup = cleanupFromSubscription(cleanup);
				}
				else if(typeof cleanup !== 'function'){
					throw new TypeError(`${cleanup} is not a function`);
				}

				this._cleanup = cleanup;
			}

		} catch (err) {
			_observer.error(err);
			return;
		}

    if(subscriptionClosed(this)){
      cleanupSubscription(this);
    }
    return;

	}
  @nonenumerable
  unsubscribe(){
    closeSubscription(this);
  }
}
