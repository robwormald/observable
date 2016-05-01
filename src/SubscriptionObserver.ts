import {Subscription} from './Subscription'
import {nonenumerable} from './utils'

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

export class SubscriptionObserver {
	constructor(private _subscription:Subscription){}

  @nonenumerable
  next(value?:any){
    let subscription = this._subscription;

    if(subscriptionClosed(subscription)){
      return undefined;
    }

    let observer = subscription._observer;
    try {
      let next = observer.next;
      if(!next){
        return undefined;
      }
      if(typeof next !== 'function'){
        throw new TypeError(`${next} is not a function!`);
      }
      return next.call(observer, value);
    } catch (error) {

    }
  }

  @nonenumerable
  error(err?:any){
    let subscription = this._subscription;

    if(subscriptionClosed(subscription)){
      return undefined;
    }
    let observer = subscription._observer;

    try {
      let errorHandler = observer.error;
      if(!errorHandler){
        throw err;
      }
      err = errorHandler.call(observer, err);
    } catch (error) {
      try {
        cleanupSubscription(subscription);
      }
      finally {
        throw error;
      }
    }
    cleanupSubscription(subscription);
    return err;

  }

  @nonenumerable
  complete(){
    let subscription = this._subscription;

    if(subscriptionClosed(subscription)){
      return undefined;
    }

    let observer = subscription._observer;
    subscription._observer = undefined;

    try {
      let completeHandler = observer.complete;
      if(!completeHandler){
        return undefined;
      }
      completeHandler.call(observer);
    } catch (error) {
      try{
        cleanupSubscription(subscription);
      }
      finally {
        throw error;
      }
    }

  }
}
