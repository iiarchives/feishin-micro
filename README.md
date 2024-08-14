<img src="assets/desktop.png" alt="logo" title="feishin-micro" align="right" height="60px" />

# Feishin Micro

Feishin Micro is a miniplayer for Feishin with most full client features built-in.

Note: Only tested on Linux and Navidrome. Jellyfin may not work as intended. 

Note 2: The client does not have a window frame, you will need to use another way to drag the window out of the center of display 1 (for example: win + arrow keys, or [this button on Plasma](assets/readme/move-button.avif))

## Screenshots

![Image-1](assets/readme/Player1.avif)

![Image-2](assets/readme/Player2.avif)

![Image-3](assets/readme/Player3.avif)

## Requirements

- bun + nodeJS
- (optional) iiPython Feishin (https://github.com/iiPythonx/feishin/tree/custom)

## Development & Packaging

Getting up is as simple as:

```shell
git clone https://github.com/iiarchives/feishin-micro
cd feishin-micro
bun install

# to package
bun run build

# to run a dev instance
bun run start
```

## Contributing

Feel free to open a pull request as long as it follows our code standards. Be sure to test beforehand.

We may not accept pull requests if it is not a worthwhile addition which benefits everybody.