# Source Reliability Engine Report

## Core Objective
Evaluates authority, authenticity, evidence strength, consistency, review history, usage frequency, and expert rating for all scriptural sources.

## Mandatory Invariant
- **No Automatic Rejections**: Sources receive a reliability score between 0–100 but are NEVER automatically discarded (`isAutoRejected = false`).

## Evaluation Formula
$$\text{Reliability} = 0.25 \cdot \text{Authority} + 0.20 \cdot \text{Authenticity} + 0.20 \cdot \text{Evidence} + 0.15 \cdot \text{Consistency} + 0.10 \cdot \text{Review} + 0.10 \cdot \text{ExpertRating}$$

## Initial Source Benchmarks
- **Mayamatam Critical Translation (IGNCA Edition)**: 96 / 100
- **Manasara Vastu Shastra Classical Corpus**: 93 / 100
- **Lal Kitab Astro-Vastu Diagnostic Manual**: 78 / 100
