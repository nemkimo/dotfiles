return {
  cmd = { "rust-analyzer" },
  filetypes = { "rust" },
  root_markers = { "Cargo.toml", "rust-project.json", ".git" },
  capabilities = {
    experimental = {
      serverStatusNotification = true,
    },
  },
}
