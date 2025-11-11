vim.lsp.enable({ "cpp", "lua", "python", "rust", "svelte", "typescript", "zig" })

vim.diagnostic.config({
  virtual_text = true,
  -- virtual_lines = { current_line = true },
})

vim.opt.nu = true
vim.opt.relativenumber = true

vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.expandtab = true

vim.opt.smartindent = true
vim.opt.cursorline = true

vim.opt.hlsearch = false
vim.opt.incsearch = true
vim.opt.ignorecase = true
vim.opt.smartcase = true

vim.opt.completeopt = "menuone,noselect"

vim.opt.termguicolors = true

vim.opt.showmode = false
vim.opt.wrap = false

vim.opt.scrolloff = 8
vim.opt.signcolumn = "yes"
vim.opt.isfname:append("@-@")

vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"
vim.opt.undofile = true

vim.opt.updatetime = 50

vim.opt.listchars = {
  tab = "▸ ",
  trail = "·",
}
vim.opt.list = true

vim.opt_local.foldmethod = "indent"
vim.opt.foldenable = false
vim.opt.foldlevel = 99
