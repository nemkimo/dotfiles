return {
  "stevearc/conform.nvim",
  enabled = true,
  opts = {},
  config = function()
    require("conform").setup({
      formatters_by_ft = {
        c = { "clang-format" },
        cpp = { "clang-format" },
        javascript = { "prettier" },
        json = { "prettier" },
        lua = { "stylua" },
        markdown = { "prettier" },
        rust = { "rustfmt" },
        sh = { "shfmt" },
        svelte = { "prettier" },
        typescript = { "prettier" },
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
