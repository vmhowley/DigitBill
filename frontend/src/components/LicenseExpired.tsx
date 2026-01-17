import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LicenseExpired: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const charSet = "01$?!#@%&*ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const characters = charSet.split("");
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#f00"; // Red Matrix
            ctx.font = fontSize + "px monospace";

            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleRenew = () => {
        navigate('/upgrade');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            overflow: 'hidden',
            textAlign: 'center'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }}
            />

            <style>
                {`
                @keyframes shake {
                    0% { transform: translate(0,0) }
                    2% { transform: translate(-5px, 2px) }
                    4% { transform: translate(5px, -2px) }
                    6% { transform: translate(-2px, 5px) }
                    8% { transform: translate(2px, -5px) }
                    10% { transform: translate(0,0) }
                }
                @keyframes glitch-skew {
                    0% { transform: skew(0deg) }
                    20% { transform: skew(-5deg) }
                    24% { transform: skew(5deg) }
                    28% { transform: skew(0deg) }
                }
                .status-box {
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid #f00;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 50px rgba(255, 0, 0, 0.2);
                    animation: shake 5s infinite;
                    max-width: 90%;
                    position: relative;
                }
                .warning-edge {
                    position: absolute;
                    top: -2px; left: -2px; right: -2px; bottom: -2px;
                    border: 2px solid #f00;
                    opacity: 0.5;
                    pointer-events: none;
                }
                .blink {
                    animation: blink 0.5s step-end infinite;
                }
                @keyframes blink {
                    50% { opacity: 0 }
                }
                `}
            </style>

            <div className="status-box">
                <div className="warning-edge" />
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: 900,
                    margin: 0,
                    color: '#f00',
                    letterSpacing: '8px',
                    textShadow: '0 0 20px #f00'
                }}>
                    DISCONNECT.
                </h1>

                <h2 style={{
                    fontSize: '1.5rem',
                    margin: '1rem 0',
                    color: '#fff',
                    opacity: 0.8,
                    fontStyle: 'italic'
                }}>
                    [!] LICENSE_TOKEN_EXPIRED (ERR_CORE_HALT)
                </h2>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    margin: '2rem 0',
                    paddingTop: '2rem',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    color: '#aaa',
                    lineHeight: '1.6'
                }}>
                    <p>{'>'} DETECTING SYSTEM INTEGRITY... <span style={{ color: '#f00' }}>FAILURE</span></p>
                    <p>{'>'} VERIFYING ACCESS RIGHTS... <span style={{ color: '#f00' }}>REVOKED</span></p>
                    <p>{'>'} ENFORCING OPERATIONAL HALT... <span style={{ color: '#0f0' }}>[DONE]</span></p>
                    <p style={{ marginTop: '1rem' }} className="blink">{'>'} Awaiting manual intervention...</p>
                </div>

                <button
                    onClick={handleRenew}
                    style={{
                        width: '100%',
                        padding: '1.5rem',
                        fontSize: '1.2rem',
                        background: '#f00',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        letterSpacing: '2px',
                        boxShadow: '0 5px 0 #900',
                        transition: 'all 0.1s'
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(3px)';
                        e.currentTarget.style.boxShadow = '0 2px 0 #900';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 0 #900';
                    }}
                >
                    REACTIVAR NÚCLEO (RENOVAR)
                </button>
            </div>

            <div style={{
                marginTop: '2rem',
                fontSize: '0.8rem',
                color: '#666',
                maxWidth: '600px'
            }}>
                ID de Sesión: {Math.random().toString(36).substr(2, 9).toUpperCase()} |
                Estado: LOCKED |
                Nivel de Riesgo: CRÍTICO
            </div>
        </div>
    );
};

export default LicenseExpired;
