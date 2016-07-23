# Coplay

Synchronizing video play between two peers.

## Intro

When two browsers are playing the same web video, Coplay can connect them with WebRTC (using PeerJS) and enable users to control two video players synchronously.

Coplay now works on Youku, Sohu TV, Tencent Video, Tudou, iQiyi, YouTube, AcFun, bilibili, LETV and Vimeo.

Buttons on control bar stands for "connect", "play", "pause", "sync", "restart", "fullscreen" and "video chat".

## Installation

### Chrome

Visit [Coplay on Chrome Web Store](https://chrome.google.com/webstore/detail/coplay/heolgpojkkeacaokbpolhalhlaidpkkc/) to install.

### Firefox

Visit [Coplay on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/coplay/) to install.

## Usage

Both browsers visit a same video page, activate Coplay and one of the users enter the other one's peer ID and connect.

After establishing the connection, both users can perform pause/resume/seek/restart/sync actions.

![Coplay](coplay.png)

## Options

* Custom server - You can specify custom PeerJS server. (eg. If you want to use it on Youtube but don't want to allow requests to insecure domains, you can set up a custom PeerJS server with HTTPS support.)
* Key - Provide additional auth key to your custom server (if necessary).
* Auto-activate - If Coplay detected supported video players on applicable sites, it will be activated automatically.

## FAQ

* Why Peer ID doesn't show up on Youtube?

  Youtube uses HTTPS but PeerJS (the WebRTC service which Coplay rely on) will make some HTTP requests, which are blocked by browsers' security policies. Current work around see [here](http://du.screenstepslive.com/s/docs/m/7107/l/219447-allow-mixed-content-in-browsers). Or you can set up your custom PeerJS server with HTTPS support.

## One More Thing

We still need a better icon for Coplay!
