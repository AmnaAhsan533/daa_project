# Divide & Conquer Algorithm Visualizer

An interactive full-stack web application built with **React** and **FastAPI** to visualize the execution of classic Divide & Conquer algorithms on large datasets ($N > 100$).

## Algorithms Implemented
- **Closest Pair of Points (O(n \log n)):** Visualizes 2D plane partitioning, median dividing lines, central strip inspections, and minimum Euclidean distance updates.
- **Karatsuba Integer Multiplication (O(n**{1.585})):** Breaks down large multi-digit integer multiplication into upper/lower splits, three recursive sub-products, and base-10 shift combinations.

## Features
- Step-by-step execution tracing with **Play/Pause**, **Next/Previous**, **Reset**, and **Playback Speed** controls.
- Pre-generated benchmark datasets (10 test files per problem) with automated runtime verification.

## Tech Stack
- **Frontend:** React (Vite), HTML5 Canvas, Lucide Icons
- **Backend:** Python, FastAPI