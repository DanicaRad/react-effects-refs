import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Card from './Card';
import "./Deck.css";

const BASE_URL = `https://deckofcardsapi.com/api/deck`;

const Deck = () => {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function getDeck() {
      const deckRes = await axios.get(`${BASE_URL}/new/shuffle/?deck_count=1`);
      setDeck(deckRes.data);
    }
    getDeck()

  }, [setDeck]);

  const getCard = async () => {
    try {
    const cardRes = await axios.get(`${BASE_URL}/${deck.deck_id}/draw/?count=1`);

    if (cardRes.data.remaining === 0 ) {
      setAutoDraw(false);
      throw new Error("No cards remaining.");
    }

    const card = cardRes.data.cards[0];
    setDrawn(d => [...d,
      {
        id: card.code,
        name: card.suit + " " + card.value,
        image: card.image
      }
    ]);
    } catch(err) {
      alert(err);
    }
  }

  const drawCardOnClick = (evt) => {
    setAutoDraw(false);
    getCard();
  }

  useEffect(function setAutoDrawTimer() {
    if ( autoDraw && !timerRef.current ) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    } 
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  }

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <>
          <button className='manual-draw' onClick={drawCardOnClick}>Manually draw a card on click</button> 
          <button className='auto-draw' onClick={toggleAutoDraw}>{autoDraw ? "Stop drawing" : "Start drawing"}</button>
        </>
        ) : null }
        <div className="Cards">{cards}</div>
    </div>
  );
};

export default Deck;