#!/usr/bin/env python3
"""Original CC0 synthetic demo soundscapes. Offline; requires NumPy, no downloads.
All oscillators use integral cycles over 12 s and noise is periodic FFT noise.
"""
from pathlib import Path
import wave
import numpy as np

RATE, SECONDS = 22050, 12
N = RATE * SECONDS
T = np.arange(N) / RATE
RNG = np.random.default_rng(20261105)
OUT = Path(__file__).resolve().parents[1] / 'public' / 'audio'


def tone(hz):
    return np.sin(2 * np.pi * round(hz * SECONDS) / SECONDS * T)


def noise(cutoff):
    frequencies = np.fft.rfftfreq(N, 1 / RATE)
    spectrum = np.fft.rfft(RNG.standard_normal(N))
    filtered = np.fft.irfft(spectrum / (1 + (frequencies / cutoff)**4), n=N)
    return filtered / max(np.std(filtered), 1e-9)


def event(start, duration, frequency, volume=1):
    elapsed = (T - start) % SECONDS
    envelope = np.where(elapsed < duration, np.sin(np.pi * np.minimum(elapsed / duration, 1))**2, 0)
    return volume * envelope * (tone(frequency) + 0.18 * tone(frequency * 2))


def save(name, signal):
    signal = signal - signal.mean()
    signal = signal / max(np.max(np.abs(signal)), 1e-9) * 0.66
    pcm = (signal * 32767).astype('<i2')
    assert len(pcm) == N and np.isfinite(signal).all()
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(pcm.tobytes())
    print(f'{name}.wav: {SECONDS}s mono PCM16, {RATE}Hz')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    forest = noise(1300) * 0.14 * (1 + 0.2 * tone(1 / 6))
    for start, hz in [(1, 1900), (1.4, 2400), (4, 1700), (7.2, 2300), (9, 2700), (9.4, 2200)]:
        forest += event(start, 0.22, hz, 0.32)
    save('forest', forest)
    rain = noise(4800) * 0.45 + noise(600) * 0.2
    rain *= 0.9 + 0.1 * tone(1 / 12)
    save('rain', rain)
    ocean = noise(2400) * (0.15 + 0.7 * (0.5 + 0.5 * tone(1 / 6))**2) + noise(170) * 0.12
    save('ocean', ocean)
    cafe = noise(260) * (0.3 + 0.1 * tone(1 / 3)) + noise(1800) * 0.035
    for start in [1.3, 4.2, 8.8, 10.1]:
        cafe += event(start, 0.12, 1650, 0.18) + event(start + 0.15, 0.2, 2200, 0.1)
    save('cafe', cafe)
    instrumental = np.zeros(N)
    for start, notes in [(0, [261.63, 329.63, 392]), (3, [220, 261.63, 329.63]), (6, [174.61, 220, 261.63]), (9, [196, 246.94, 293.66])]:
        for hz in notes:
            instrumental += event(start, 4.2, hz, 0.14)
    save('instrumental', instrumental)
    lofi = instrumental * 0.65 + noise(2400) * 0.018
    for start in np.arange(0, SECONDS, 0.75):
        lofi += event(float(start), 0.16, 65, 0.19)
        lofi += event(float(start + 0.375), 0.045, 5000, 0.03)
    save('lofi', lofi)
    save('white-noise', RNG.standard_normal(N))


if __name__ == '__main__':
    main()
