import { expect, test } from "@oclif/test";

describe("config:delegate:username", () => {
    test.stdout()
        .command(["config:delegate:username"])
        .it("runs hello", ctx => {
            expect(ctx.stdout).to.contain("hello world");
        });

    test.stdout()
        .command(["config:delegate:username", "--name", "jeff"])
        .it("runs hello --name jeff", ctx => {
            expect(ctx.stdout).to.contain("hello jeff");
        });
});
