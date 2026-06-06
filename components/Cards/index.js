import Card from "./Card";

function Cards() {
  const cardList = [
    {
      title: "Emails",
      count: 10,
      link: "/information",
    },
    {
      title: "Clicks",
      count: 10,
      link: "/#click",
    },
    {
      title: "Links",
      count: 10,
      link: "/links",
    },
    {
      title: "ID Card",
      count: 10,
      link: "/id-card",
    },
    {
      title: "Mega",
      count: 10,
      link: "/#mega",
    },
    {
      title: "Private",
      count: 10,
      link: "/#private",
    },
    {
      title: "Skip",
      count: 10,
      link: "/#slip",
    },
  ];

  return (
    <>
      {cardList.map((card, i) => (
        <Card key={i} title={card.title} count={card.count} link={card.link} />
      ))}
    </>
  );
}

export default Cards;
