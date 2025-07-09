return {
  "stevearc/conform.nvim",
  enabled = true,
  opts = {},
  config = function()
    require("conform").setup({
      formatters_by_ft = {
        c = { "clang-format" },
        cpp = { "clang-format" },
        json = { "prettier" },
        lua = { "stylua" },
        markdown = { "prettier" },
        sh = { "shfmt" },
        yaml = { "prettier" },
      },
      stop_after_first = false,
      format_on_save = {
        lsp_format = "fallback",
        -- async = false,
        timeout_ms = 500,
      },
    })
  end,
}
