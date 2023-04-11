# About

This is an attempt to use GPT to bootstrap a project. As an alternative to a preconfigured project create, it tries to let GPT make the decions and set up the starting project based on a brief description.

This is an experiment and it's pretty rough around the edges.

# What to do

- Clone the repository
- `yarn`
- `yarn build`
- Set the environment-variable `OPENAI_API_KEY`
- Run `dist/index.js` from an _empty_ folder.

It doesnt' have any overwrite-protection or path-argument yet, so if you run it in a folder with contents, your risk it being overwritten.

# API-key
It looks for an api-key in the environment-variable `OPENAI-API-KEY`. Instructions for how to get one can be found in the [OpenAI developer documentation](https://platform.openai.com/docs/api-reference/introduction)

