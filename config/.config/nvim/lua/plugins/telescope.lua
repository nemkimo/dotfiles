return {
  {
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    dependencies = { 'nvim-lua/plenary.nvim' },
    config = function()
      require('telescope').setup({
        defaults = {
          cache_picker = {
            num_pickers = 5,
          },
        },
      })
      local builtin = require('telescope.builtin');
      vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = 'Find files' })
      vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = 'Live grep' })
      vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = 'Find buffers' })
      vim.keymap.set('n', '<leader>gf', builtin.git_files, { desc = 'Git files' })
      vim.keymap.set('n', '<leader>fc', builtin.commands, { desc = 'Find commands' })
      vim.keymap.set('n', '<leader>fh', builtin.oldfiles, { desc = 'Find recent files' })
      vim.keymap.set('n', '<leader>fs', builtin.search_history, { desc = 'Find recent searches' })
      vim.keymap.set('n', '<leader>fr', builtin.lsp_references, { desc = 'Find references' })
      vim.keymap.set('n', '<leader>fp', builtin.pickers, { desc = 'Find pickers' })
    end,
  },
}
