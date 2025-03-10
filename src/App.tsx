import {useState} from 'react';

type SquareValue = 'X' | 'O' | null;

function Square({value, isWinner, onSquareClick}: {
    value: SquareValue,
    isWinner: boolean,
    onSquareClick: () => void
}) {
    let className = 'square';
    if (isWinner) {
        className += ' winner';
    }
    return (
        <button className={className} onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({xIsNext, squares, boardSize, onPlay}: {
    xIsNext: boolean;
    squares: SquareValue[],
    boardSize: number,
    onPlay: (nextSquares: SquareValue[]) => void
}) {
    function handleClick(i: number) {
        if (squares[i] || calculateWinner(squares, boardSize)) {
            return;
        }
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }
        onPlay(nextSquares);
    }

    const winner = calculateWinner(squares, boardSize);
    const status = winner == 'Draw'
        ? 'Draw'
        : winner
            ? 'Winner: ' + squares[winner[0]]
            : 'Next player: ' + (xIsNext ? 'X' : 'O');

    const squareElements = squares.map((square: SquareValue, index: number) => (
        <Square key={index} value={square} isWinner={Array.isArray(winner) && winner.includes(index)}
                onSquareClick={() => handleClick(index)} />));

    const boardRows = [...Array(boardSize).keys()].map((i) => (
        <div key={i} className="board-row">
            {squareElements.slice(boardSize * i, boardSize * (i + 1))}
        </div>
    ));

    return (
        <>
            <div className="status">{status}</div>
            {boardRows}
        </>
    );
}

export default function Game() {
    const [historyOrderAsc, setHistoryOrderAsc] = useState(true);
    const [currentMove, setCurrentMove] = useState(0);
    const [boardSize, setBoardSize] = useState(3);
    const [history, setHistory] = useState<SquareValue[][]>([Array(3 * 3).fill(null)]);

    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    function handlePlay(nextSquares: SquareValue[]) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function handleBoardResize(newSize: number) {
        setHistory([Array(newSize * newSize).fill(null)]);
        setCurrentMove(0);
        setBoardSize(newSize);
    }

    function jumpTo(nextMove: number) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((_, move) => {
        let description;
        if (move > 0) {
            description = 'move #' + move;
        } else {
            description = 'game start';
        }
        if (move === currentMove) {
            return (<li key={move}>{'You are here at ' + description}</li>)
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{'Go to ' + description}</button>
            </li>
        );
    });

    return (
        <div className="game">
            <div className="game-board">
                <input type="range" min="3" max="5" step="1" defaultValue="3"
                       onChange={(e) => handleBoardResize(Number(e.target.value))} />
                <Board xIsNext={xIsNext} squares={currentSquares} boardSize={boardSize} onPlay={handlePlay} />
            </div>
            <div className="game-info">
                <button onClick={() => setHistoryOrderAsc(!historyOrderAsc)}>Toggle order</button>
                <ul>{historyOrderAsc ? moves : moves.reverse()}</ul>
            </div>
        </div>
    );
}

function calculateWinner(squares: SquareValue[], size: number): number[] | 'Draw' | null {
    const lines: number[][] = [];
    // rows
    for (let i = 0; i < size; i++) {
        lines.push([...squares.keys()].slice(size * i, size * (i + 1)));
    }

    // columns
    for (let i = 0; i < size; i++) {
        const col: number[] = [];
        for (let j = 0; j < size; j++) {
            col.push(i + j * size)
        }
        lines.push(col);
    }

    // diagonals
    const diagonal1: number[] = [];
    const diagonal2: number[] = [];
    for (let i = 0; i < size; i++) {
        diagonal1.push(i * (size + 1));
        diagonal2.push((i + 1) * (size - 1));
    }

    lines.push(diagonal1);
    lines.push(diagonal2);

    for (let i = 0; i < lines.length; i++) {
        const lineValues = lines[i].map((index) => squares[index]);
        const first = lineValues[0];
        if (first && lineValues.every(element => element === first)) {
            return lines[i];
        }
    }
    return squares.some(element => element === null) ? null : 'Draw';
}
