return {
  "stevearc/oil.nvim",
  opts = {},
  dependencies = { { "nvim-mini/mini.icons", opts = {} } },
  -- dependencies = { "nvim-tree/nvim-web-devicons" }, -- use if you prefer nvim-web-devicons
  lazy = false,
  config = function()
    require("oil").setup()
    vim.keymap.set("n", "<leader>t", "<CMD>Oil<CR>", { desc = "Open parent directory" })
  end,
}
