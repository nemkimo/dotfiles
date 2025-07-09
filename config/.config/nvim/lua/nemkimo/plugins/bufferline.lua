return {
  "akinsho/bufferline.nvim",
  version = "*",
  dependencies = "nvim-tree/nvim-web-devicons",
  config = function()
    require("bufferline").setup()
    vim.keymap.set("n", "<S-Tab>", vim.cmd.BufferLineCyclePrev, { desc = "Cycle prev tab" })
    vim.keymap.set("n", "<Tab>", vim.cmd.BufferLineCycleNext, { desc = "Cycle next tab" })
  end,
}
