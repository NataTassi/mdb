  ## MDb
  Video streaming platform built for personal use and educational purposes. 

  ## Tech stack
  * React
  * Next.js
  * Video.js
  * Bootstrap
  * Redis
  * Python
  * Docker

## Notes
  * Every service composing this app is connected to the default network created by Docker Compose. If you get "ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network" when starting the app, you have to edit /etc/docker/daemon.json (as root) and add an additional address pool (the chosen IP range shouln't overlap with any other network you are in, like a VPN), then restart docker.service so the changes can be applied with "sudo systemctl restart docker".
  * If you mount your movies directory avoid automounting it may mess the permissions required for Transmission to write the progress of the downloads and once you restart the containers all progress is lost. Instead create a device directory with "sudo mkdir /mnt/<device_name>", get the desired partition name with "lsblk", and mount the partition with "sudo mount -t ntfs-3g /dev/<partition> /mnt/<device_name>".

## Screenshots

<img src="https://i.imgur.com/SuYFeOu.png" title="Home">

<img src="https://i.imgur.com/rwFdxPE.png" title="Info popup">

<img src="https://i.imgur.com/oig3c69.png" title="Info details">

<img src="https://i.imgur.com/WWLDmkU.png" title="Player">

<img src="https://i.imgur.com/r97U3B1.png" title="Search">

<img src="https://i.imgur.com/LVtsTK4.png" title="Advanced search">
