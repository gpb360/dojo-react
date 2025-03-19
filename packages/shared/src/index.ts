/**
 * Shared utilities for Dojo to React migration
 */

/**
 * Utility type to describe a simple function
 */
export type SimpleFunction = (...args: any[]) => any;

/**
 * Helper to safely get a property from an object
 * 
 * @param obj The object to get property from
 * @param key The property key to look for
 * @returns The property value if it exists
 */
export function safeGetProperty<T, K extends string>(obj: T, key: K): any {
  if (!obj) return undefined;
  
  const anyObj = obj as any;
  return anyObj[key];
}

/**
 * Helper to check if a property is a function
 * 
 * @param obj The object to check
 * @param key The property key to look for
 * @returns True if the property exists and is a function
 */
export function isPropertyFunction<T, K extends string>(obj: T, key: K): boolean {
  const prop = safeGetProperty(obj, key);
  return typeof prop === 'function';
}

/**
 * Helper to get a DOM element from props or options
 * 
 * @param props Props object that might contain a domElement or domElementGetter
 * @param opts Options object that might contain a domElementGetter
 * @returns The DOM element
 */
export function getDomElement(props: any, opts: { domElementGetter?: () => HTMLElement }): HTMLElement {
  // Use the domElement from props if available
  if (props.domElement) {
    return props.domElement;
  }
  
  // Use the domElementGetter from options if available
  if (opts.domElementGetter) {
    return opts.domElementGetter();
  }
  
  // Use the default domElementGetter from props if available
  if (props.domElementGetter) {
    return props.domElementGetter();
  }
  
  throw new Error("No domElement or domElementGetter provided");
}

/**
 * Helper to create a promise function from a synchronous function
 * 
 * @param fn The synchronous function
 * @returns A function that returns a promise
 */
export function promisify<T extends SimpleFunction>(fn: T): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return (...args: Parameters<T>) => Promise.resolve().then(() => fn(...args));
} 