/**
 * Abstract implementations to the System Delphi unit
 */
declare module "@delphi/system" {
    export {
        
    };
}

declare module "@delphi/system/classes" {
    export abstract class TThread {
        /**
         * Determines wheter a thread is terminated or not
         */
        protected terminated: boolean;

        /**
         * Called upon Thread execution
         */
        abstract execute();

        /**
         * Starts the thread
         */
        public start();

        /**
         * Terminates the thread
         */
        public terminate();

        /**
         * Sleeps the thread
         * @param ms The amount of milisseconds to sleep
         */
        public sleep(ms: number);
    }
}