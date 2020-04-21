function makeBookMarksArray() {
  return [
    {
      title: "Basic",
      url: "basic.com",
      description: "boring",
      rating: 1,
      id: 1,
    },
    {
      title: "Not Basic",
      url: "notbasic.com",
      description: "noring",
      rating: 5,
      id: 2,
    },
    {
      title: "Complex",
      url: "complex.com",
      description: "Complicated stuff",
      rating: 3,
      id: 3,
    },
    {
      title: "Cool stuff",
      url: "coolstuff.com",
      description: "Cool stuff",
      rating: 4,
      id: 4,
    },
    {
      title: "Mildly amusing",
      url: "ma.com",
      description: "Eh, kind of nice",
      rating: 3,
      id: 5,
    },
  ];
}

module.exports = {
  makeBookMarksArray,
};
