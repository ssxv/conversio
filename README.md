# Conversio

A simple WhatsApp clone.

## Table of Contents
- [Conversio](#conversio)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Technologies Used](#technologies-used)
  - [License](#license)

## Introduction

This project is a WhatsApp clone created using:
    
- server - `nodejs`, nestjs
- database - `postgres`
- client - `reactjs`, nextjs
    
It aims to replicate the basic features of WhatsApp.

## Features

- Real-time messaging
- Video calling
- User authentication

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Docker

### Installation

Guide users through the installation process. Use code blocks and examples when necessary.

```bash
$ git clone https://github.com/ssxv/conversio.git
$ cd conversio
$ docker compose up
```

### Technologies Used

- server - `nodejs`
    - nestjs - backend framework
    - socket.io - real time chat messages

- database - `postgres`

- client - `reactjs`
    - nextjs - frontend framework
    - simple-peer - video calls using webRTC

### License
See the LICENSE.md file for details.
