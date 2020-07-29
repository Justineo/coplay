# Coplay

Synchronizing video play between two peers.

## Intro

When two browsers are playing the same web video, Coplay can connect them with WebRTC (using PeerJS) and enable users to control two video players synchronously.

Coplay now works on Youku, Sohu TV, Tencent Video, Tudou, iQiyi, rijula, YouTube, AcFun, bilibili, LETV and Vimeo.

Buttons on control bar stands for "connect", "play", "pause", "sync", "restart", "fullscreen" and "video chat".

## Installation

### Chrome

Visit [Coplay on Chrome Web Store](https://chrome.google.com/webstore/detail/coplay/heolgpojkkeacaokbpolhalhlaidpkkc/) to install.

### Firefox

Visit [Coplay on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/coplay/) to install.

## Usage

Both browsers visit a same video page, activate Coplay and one of the users enter the other one's peer ID and connect.

After establishing the connection, both users can perform pause/resume/seek/restart/sync actions.

For HTTPS sites, users can use video calls to video chat with each other while watching videos. *You might need to put your headphones on while video chatting because Coplay has no <abbr>AEC</abbr>(acoustic echo cancellation) support. (Help needed)*

![Coplay](coplay.png)

## Options

* Enable default HTTPS server - To work with HTTPS sites you have to use PeerJS service over HTTPS. (eg. If you want to use it on YouTube but don't want to allow requests to insecure domains, you can use the default HTTPS service or you can set up a custom PeerJS server with HTTPS support using the next options.)
* Custom server - You can specify custom PeerJS server.
* Key - Provide additional auth key to your custom server (if necessary).
* Auto-activate - If Coplay detected supported video players on applicable sites, it will be activated automatically.

## FAQ

* Why Peer ID doesn't show up on Youtube?

  Youtube uses HTTPS but PeerJS (the WebRTC service which Coplay rely on) will make some HTTP requests, which are blocked by browsers' security policies. You can 1. enable default HTTPS server in the options or 2. set up your custom PeerJS server with HTTPS support.da
