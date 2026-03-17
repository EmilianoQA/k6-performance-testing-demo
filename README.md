# Performance Testing Demo with k6

This project demonstrates basic performance testing scenarios using k6.

The goal is to simulate different traffic conditions and observe how an API behaves under load.

Performance testing helps teams answer important questions such as:

- How does response time change when traffic increases?
- How many concurrent users can the system handle?
- When does the system start to degrade?

The tests in this repository target a public API endpoint:
https://api.escuelajs.co/api/v1/products

## Test Scenarios

Smoke Test
Quick validation to confirm that the API endpoint is reachable and responds correctly.

Load Test
Simulates a normal level of traffic to evaluate response times and system stability.

Stress Test
Gradually increases the number of concurrent users to observe how the system behaves under higher pressure.

## Running the tests

Install k6 and run:

k6 run tests/smoke.js

k6 run tests/load.js

k6 run tests/stress.js

## Why this matters

Performance issues often appear only under real traffic conditions.  
Testing system behavior under load helps detect slow endpoints, resource bottlenecks, and potential failures before they reach production.

This repository shows a simple starting point for integrating performance testing into QA workflows.

##  By 
Emiliano Maure - Qa Engineer Automation