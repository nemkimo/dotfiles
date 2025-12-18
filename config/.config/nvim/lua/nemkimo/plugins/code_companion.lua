return {
  "olimorris/codecompanion.nvim",
  enabled = true,
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  opts = {
    interactions = {
      chat = {
        adapter = {
          name = "copilot",
          model = "claude-sonnet-4.5",
        },
        inline = {
          adapter = "copilot",
        },
        cmd = {
          adapter = "copilot",
        },
      },
    },
  },
}
