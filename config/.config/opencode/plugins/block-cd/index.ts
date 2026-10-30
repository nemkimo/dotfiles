import { Plugin } from "@opencode/plugin";

const pattern = /(^|[;&|(`{]|\$\(|\n)\s*(cd|pushd)(\s|;|&|\||$)/;

export default Plugin.define({
  id: "block-cd",
  async setup(ctx) {
    await ctx.shell.hook("create.before", (event) => {
      if (pattern.test(event.command))
        throw new Error("cd and pushd are blocked. Use the workdir parameter.");
    });
  },
});
