# coplay

Synchronizing video play between two peers.

## Intro

When two browsers are playing the same web video, coplay can connect them with WebRTC (using PeerJS) and enable users to control two video players synchronously.

Coplay now works on Youku, Sohu TV, Tencent Video, Tudou, iQiyi and YouTube.

## Installation

*Not published on Chrome Web Store or Firefox Add-ons yet.*

### Chrome

Visit `chrome://extensions` and enable developer mode.
Load unpacked extension (`extensions/packed/coplay.zip`).

### Firefox

Drag `extensions/packed/coplay.xpi` into Firefox to install.

## Usage

Both browsers visit a same video page, activate coplay and one of the users enter the other one's peer ID and connect.

After establishing the connection, both users can perform pause/resume/seek/restart/sync actions.
