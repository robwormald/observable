/**
 * Typescript Zone-aware implementation of zenparsing/es-observable spec proposal
 */

import {Subscription} from './subscription'
import {nonenumerable} from './utils'

export interface Observer {
	next?:(value?:any) => void;
	error?:(err?:any) => void;
	complete?: () => void;
}

export interface SubscriberFunction {
	(observer:Observer): Function | void;
}

export class Observable {
	constructor(private _subscriber:SubscriberFunction){
		if(typeof _subscriber !== 'function'){
			throw new TypeError('Observable initializer must be a function!');
		}
	}

  @nonenumerable
	subscribe(observer:Observer): Subscription {
		return new Subscription(observer, this._subscriber);
	}

  forEach(fn:(value:any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      if(typeof fn !== 'function'){
        throw new TypeError(`${fn} is not a function`);
      }
        let subscription = this.subscribe({
          next(value){
            try {
              return fn(value);
            } catch (err) {
              reject(err);
              subscription.unsubscribe();
            }
          },
          error(err){
            reject(err);
          },
          complete(){
            resolve();
          }
        });
    });
  }
  [Symbol['observable']](){
    return this;
  }
  static get [Symbol['species']](){
    return this;
  }
}
