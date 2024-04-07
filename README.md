# Dotfiles

This repository contains my shared configuration files. To install them on a new system use [GNU Stow](https://www.gnu.org/software/stow/manual/stow.html).

# Usage

## Prerequisites
GNU Stow is installed on the system.

## Set the symlinks
```
# from the root of the repository
stow -d . -t $HOME config
```

## Unset the symlinks
```
# from the root of the repository
stow -d . -t $HOME -D config
```