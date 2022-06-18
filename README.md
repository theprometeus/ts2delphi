# ts2delphi
ts2delphi is a tool that can transpile TypeScript to Delphi / Pascal.

[![Maintenance](https://img.shields.io/badge/Maintained%3F-no-red.svg)](https://bitbucket.org/lbesson/ansi-colors)

This is a BETA project, it can change drastically over time, so use it with caution for now and stay updated! :D

# Compilation Rules
- Structure
    - When any function, named or not, is exported by `default`, it will be considered as the unit `begin` point
    - Any exported classes will be exported as `public`, otherwise you'll need to specify if they're `protected` or `private` using annotations.

- Comments
    - Comments flying around without any assignment or reference will not be transpiled, only the ones that are assigned to something like classes, methods, functions, variables, etc
