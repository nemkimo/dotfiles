return {
  {
    'VonHeikemen/lsp-zero.nvim',
    branch = 'v2.x',
    dependencies = {
      -- LSP Support
      { 'neovim/nvim-lspconfig' }, -- Required
      {                            -- Optional
        'williamboman/mason.nvim',
        build = function()
          pcall(vim.cmd, 'MasonUpdate')
        end,
      },
      { 'williamboman/mason-lspconfig.nvim' }, -- Optional

      -- Autocompletion
      { 'hrsh7th/nvim-cmp' },     -- Required
      { 'hrsh7th/cmp-nvim-lsp' }, -- Required
      { 'L3MON4D3/LuaSnip' },     -- Required
    },
    config = function()
      local lsp = require('lsp-zero').preset({})

      lsp.on_attach(function(client, bufnr)
        lsp.default_keymaps({ buffer = bufnr })
      end)

      -- (Optional) Configure lua language server for neovim
      require('lspconfig').lua_ls.setup(lsp.nvim_lua_ls())

      lsp.setup()

      local cmp = require('cmp')
      cmp.setup({
        mapping = {
          ['<CR>'] = cmp.mapping.confirm({ select = false }),
        }
      })

      -- Global mappings.
      -- See `:help vim.diagnostic.*` for documentation on any of the below functions
      vim.keymap.set('n', '<leader>dp', vim.diagnostic.open_float, { desc = 'Popup' })
      vim.keymap.set('n', '<leader>d,', vim.diagnostic.goto_prev, { desc = 'Prev' })
      vim.keymap.set('n', '<leader>d.', vim.diagnostic.goto_next, { desc = 'Next' })
      vim.keymap.set('n', '<leader>dl', vim.diagnostic.setloclist, { desc = 'List' })

      -- Use LspAttach autocommand to only map the following keys
      -- after the language server attaches to the current buffer
      vim.api.nvim_create_autocmd('LspAttach', {
        group = vim.api.nvim_create_augroup('UserLspConfig', {}),
        callback = function(ev)
          -- Enable completion triggered by <c-x><c-o>
          vim.bo[ev.buf].omnifunc = 'v:lua.vim.lsp.omnifunc'

          -- Buffer local mappings.
          -- See `:help vim.lsp.*` for documentation on any of the below functions
          local opts = { buffer = ev.buf }
          vim.keymap.set('n', '<leader>lD', vim.lsp.buf.declaration, { desc = 'Go to declaration' })
          vim.keymap.set('n', '<leader>ld', vim.lsp.buf.definition, { desc = 'Go to definition' })
          vim.keymap.set('n', '<leader>lh', vim.lsp.buf.hover, { desc = 'Hover' })
          vim.keymap.set('n', '<leader>li', vim.lsp.buf.implementation, { desc = 'Go to implementation' })
          vim.keymap.set('n', '<leader>ls', vim.lsp.buf.signature_help, { desc = 'Signature' })
          vim.keymap.set('n', '<leader>wa', vim.lsp.buf.add_workspace_folder, { desc = 'Add workspace folder' })
          vim.keymap.set('n', '<leader>wr', vim.lsp.buf.remove_workspace_folder, { desc = 'Remove workspace folder' })
          vim.keymap.set('n', '<leader>wl', function()
            print(vim.inspect(vim.lsp.buf.list_workspace_folders()))
          end, { desc = 'List workspace folders' })
          vim.keymap.set('n', '<leader>lt', vim.lsp.buf.type_definition, { desc = 'Type definition' })
          vim.keymap.set('n', '<leader>ln', vim.lsp.buf.rename, { desc = 'Rename' })
          vim.keymap.set({ 'n', 'v' }, '<leader>da', vim.lsp.buf.code_action, { desc = 'Action' })
          vim.keymap.set('n', '<leader>lr', vim.lsp.buf.references, { desc = 'References' })
          vim.keymap.set('n', '<leader>lf', function()
            vim.lsp.buf.format { async = true }
          end, { desc = 'Format' })
        end,
      })
    end
  }
}
