import { expect, test } from "@oclif/test";

describe("config:delegate", () => {
    test.stdout()
        .command(["config:delegate"])
        .it("runs hello", ctx => {
            expect(ctx.stdout).to.contain("hello world");
        });

    test.stdout()
        .command(["config:delegate", "--name", "jeff"])
        .it("runs hello --name jeff", ctx => {
            expect(ctx.stdout).to.contain("hello jeff");
        });
});
