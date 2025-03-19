/**
 * single-spa-dojo
 * Helper library for using single-spa with Dojo applications
 */

export interface DojoMountOptions {
  registry?: any;
  domNode?: HTMLElement;
  sync?: boolean;
}

export interface SingleSpaDojoOptions {
  // The renderer function imported from Dojo
  renderer: Function;
  
  // The function used to render dom elements in Dojo
  v: Function;
  
  // The function used to render dom elements in Dojo
  w: Function;
  
  // The class or function for your root Dojo component
  appComponent: any;
  
  // An object of Dojo MountOptions
  mountOptions?: DojoMountOptions;
}

export interface SingleSpaDojoLifecycles {
  bootstrap: () => Promise<void>;
  mount: (props: any) => Promise<void>;
  unmount: () => Promise<void>;
}

/**
 * Creates single-spa lifecycle functions for Dojo applications
 * 
 * @param opts Configuration options for the Dojo application
 * @returns Object containing single-spa lifecycle functions (bootstrap, mount, unmount)
 */
export default function singleSpaDojo(opts: SingleSpaDojoOptions): SingleSpaDojoLifecycles {
  if (!opts) {
    throw new Error("single-spa-dojo requires options");
  }

  if (!opts.renderer) {
    throw new Error("single-spa-dojo requires renderer option");
  }

  if (!opts.v) {
    throw new Error("single-spa-dojo requires v option");
  }

  if (!opts.w) {
    throw new Error("single-spa-dojo requires w option");
  }

  if (!opts.appComponent) {
    throw new Error("single-spa-dojo requires appComponent option");
  }

  // Initialize state for the Dojo application
  let dojoRender: any = null;

  /**
   * Bootstrap lifecycle function
   * Called once when the application is first loaded
   */
  function bootstrap(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Mount lifecycle function
   * Called when the application is mounted to the DOM
   */
  function mount(props: any): Promise<void> {
    return Promise.resolve().then(() => {
      // Prepare the mount options
      const mountOptions: DojoMountOptions = opts.mountOptions || {};
      
      // If domNode not provided in mountOptions, use the one from single-spa
      if (!mountOptions.domNode && props.domElement) {
        mountOptions.domNode = props.domElement;
      }

      // Create the Dojo render function with our root component and mount options
      dojoRender = opts.renderer(
        () => opts.w(opts.appComponent, {}),
        mountOptions
      );
    });
  }

  /**
   * Unmount lifecycle function
   * Called when the application is unmounted from the DOM
   */
  function unmount(): Promise<void> {
    return Promise.resolve().then(() => {
      // If we have a render function, destroy it
      if (dojoRender && typeof dojoRender.destroy === 'function') {
        dojoRender.destroy();
        dojoRender = null;
      }
    });
  }

  return {
    bootstrap,
    mount,
    unmount
  };
} 