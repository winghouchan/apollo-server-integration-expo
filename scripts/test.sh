#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

jest_path="node_modules/jest/bin/jest.js"

node_args+=(
  # Enable experimental VM modules to allow running ES modules
  #
  # See: https://kulshekhar.github.io/ts-jest/docs/guides/esm-support#configure-jest-runtime
  # See: https://nodejs.org/api/cli.html#--experimental-vm-modules
  "--experimental-vm-modules"

  # Disable warnings of experimental features to reduce noise. The following
  # warnings are notable:
  #
  # - "VM Modules is an experimental feature and might change at any time".
  #   Emitted because experimental VM modules are enabled.
  "--disable-warning=ExperimentalWarning"
)

node "${node_args[@]}" "${jest_path}" "$@"
