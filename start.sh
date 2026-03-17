#!/bin/bash
# Wrapper so cron can find nvm/node (cron doesn't load .bashrc)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /home/katharina/git/CountdownTilMiseryEnds
npm start >> /home/katharina/git/CountdownTilMiseryEnds/server.log 2>&1
