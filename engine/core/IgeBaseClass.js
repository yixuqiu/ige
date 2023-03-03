import igeConfig from "./config.js";
class IgeBaseClass {
    constructor() {
        this.classId = "IgeBaseClass";
    }
    /**
     * Returns the class id. Primarily used to help identify
     * what class an instance was instantiated with and is also
     * output during the ige.scenegraph() method's console logging
     * to show what class an object belongs to.
     * @example #Get the class id of an object
     *     var entity = new IgeEntity();
     *
     *     // Will output "IgeEntity"
     *     console.log(entity.classId);
     */
    getClassId() {
        return this.classId;
    }
    /**
     * Provides logging capabilities to all IgeBaseClass instances.
     * @param args
     *
     * @example #Log a message
     *     var entity = new IgeEntity();
     *
     *     // Will output:
     *     //     IGE *log* [IgeEntity] : hello
     *     entity.log('Hello');
     * @example #Log an info message with an optional parameter
     *     var entity = new IgeEntity(),
     *         param = 'moo';
     *
     *     // Will output:
     *     //    moo
     *     //    IGE *log* [IgeEntity] : hello
     *     entity.log('Hello', 'info', param);
     * @example #Log a warning message (which will cause a stack trace to be shown)
     *     var entity = new IgeEntity();
     *
     *     // Will output (stack trace is just an example here, real one will be more useful):
     *     //    Stack: {anonymous}()@<anonymous>:2:8
     *     //    ---- Object.InjectedScript._evaluateOn (<anonymous>:444:39)
     *     //    ---- Object.InjectedScript._evaluateAndWrap (<anonymous>:403:52)
     *     //    ---- Object.InjectedScript.evaluate (<anonymous>:339:21)
     *     //    IGE *warning* [IgeEntity] : A test warning
     *     entity.log('A test warning', 'warning');
     * @example #Log an error message (which will cause an exception to be raised and a stack trace to be shown)
     *     var entity = new IgeEntity();
     *
     *     // Will output (stack trace is just an example here, real one will be more useful):
     *     //    Stack: {anonymous}()@<anonymous>:2:8
     *     //    ---- Object.InjectedScript._evaluateOn (<anonymous>:444:39)
     *     //    ---- Object.InjectedScript._evaluateAndWrap (<anonymous>:403:52)
     *     //    ---- Object.InjectedScript.evaluate (<anonymous>:339:21)
     *     //    IGE *error* [IgeEntity] : An error message
     *     entity.log('An error message', 'error');
     *
     */
    log(...args) {
        console.log(...args);
        if (igeConfig.debug._enabled) {
        }
        return this;
    }
}
export default IgeBaseClass;
