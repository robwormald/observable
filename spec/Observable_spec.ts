import {Observable} from '../src/Observable'

describe('Observable', () => {
  it('should exist', () => {
    expect(Observable).toBeDefined();
  });

  it('should propagate values and stuff', () => {
    let ticks = new Observable((observer) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
    });
    let count = 0;
    ticks.subscribe({
      next(value){
        expect(value).toEqual(++count);
      }
    });
  });

  it('should propagate values asynchronously', (done) => {
    let ticks = new Observable((observer) => {
      setTimeout(() => {
        observer.next(1);
      }, 100)
      setTimeout(() => {
        observer.next(1);
        observer.complete();
      }, 150);
    });
    let count = 0;
    ticks.subscribe({
      next(value){
        count++;
      },
      complete(){
        expect(count).toEqual(2);
        done();
      }
    });
    expect(count).toEqual(0);
  });

  it('should propagate values and complete', () => {
    let ticks = new Observable((observer) => {
      observer.next(1);
      observer.complete();
    });

    let complete = false;

    ticks.subscribe({
      next(value){
        expect(value).toEqual(1);
      },
      complete(){
        complete = true;
      }
    });
    expect(complete).toBe(true);
  });

  it('should handle errors', () => {
    let ticks = new Observable((observer) => {
      observer.error('FAILE');
    });

    let nexted = false;
    let completed = false;
    let error;

    ticks.subscribe({
      next(value){
        nexted = true;
      },
      error(err){
        expect(err).toEqual('FAILE');
        error = true;
      },
      complete(){
        completed = true;
      }
    });
    expect(error).toBe(true);
    expect(nexted).toBe(false);
    expect(completed).toBe(false);
  });

  it('should handle thrown errors', () => {
    let ticks = new Observable((observer) => {
      throw 'FAILE'
    });

    let nexted = false;
    let completed = false;
    let error;

    ticks.subscribe({
      next(value){
        nexted = true;
      },
      error(err){
        expect(err).toEqual('FAILE');
        error = true;
      },
      complete(){
        completed = true;
      }
    });
    expect(error).toBe(true);
    expect(nexted).toBe(false);
    expect(completed).toBe(false);
  });

  it('should clean up after itself', () => {
    let tidied = false;
    let dirtied = false;
    let ticks = new Observable((observer) => {
      dirtied = true;
      return () => {
        tidied = true;
      }
    });
    let sub = ticks.subscribe({});
    expect(tidied).toBe(false);
    expect(dirtied).toBe(true);
    sub.unsubscribe();
    expect(tidied).toBe(true);
  });

  it('should clean up after itself on error', (done) => {
    let tidied = false;
    let errored = false;
    let ticks = new Observable((observer) => {
      setTimeout(() => {
        observer.error('FAIL');
      })
      return () => {
        tidied = true;
      }
    });
    let sub = ticks.subscribe({
      error(err){
         errored = true;
      }
    });
    setTimeout(() => {
       expect(tidied).toBe(true);
       expect(errored).toBe(true);
       done();
    }, 20)

  });
});
