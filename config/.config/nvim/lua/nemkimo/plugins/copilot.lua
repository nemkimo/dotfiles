return {
  "github/copilot.vim",
  config = function()
    vim.keymap.set("i", "<C-CR>", 'copilot#Accept("\\<CR>")', {
      expr = true,
      replace_keycodes = false,
    })
    vim.g.copilot_no_tab_map = true
  end,
}
