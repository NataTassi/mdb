#!/usr/bin/python3
import os
import sys
import subprocess

argv = sys.argv
argc = len(argv)

if argc < 3 or argv[1] not in ('prod', 'dev'):
    print(f"Usage: {argv[0]} <dev | prod> [<compose options>] <command> [<command options>]")
    print("\nExamples:\n")
    print(f"{argv[0]} dev up (verbose run in development)")
    print(f"{argv[0]} dev down (stop and remove dev containers)")
    print(f"{argv[0]} prod up -d (detached run in production)")
    print(f"{argv[0]} dev build (development build)")
else:
    if subprocess.run('[ -z "$MOVIES_DIR" ]', shell=True).returncode == 0:
        print("You must first set the env var MOVIES_DIR")
        sys.exit(0)

    movies_path = 'web/public/Movies'
    subprocess.run(f'! mountpoint {movies_path} && sudo mount --bind $MOVIES_DIR {movies_path}', shell=True)
    cmd = f"docker compose -f docker-compose.yml -f compose/docker-compose.{argv[1]}.yml".split(' ') + argv[2:]
    os.execvp('docker', cmd)

# Note: subprocess.run() runs command and waits, instead os.exec*() functions replace the current process
