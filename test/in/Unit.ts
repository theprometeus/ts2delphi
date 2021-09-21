import { TThread } from "@delphi/system/classes";

export class TestThread extends TThread {
    private sleepTime: number = 1000;
    protected sleepMessage: string = "Testing!";

    public execute() {
        // While not terminated
        while(!this.terminated) {
            this.sleep(this.sleepTime);
            Writeln(this.sleepMessage);
        }
    }
};