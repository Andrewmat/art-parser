const p = require("arcsecond");

const nativeObjs = ["circle", "svg", "text"];

const strLimit = p.char("'");
const numParser = p.digits.map(r => ({
  type: "number",
  value: Number(r)
}));
const strParser = p
  .between(strLimit)(strLimit)(p.everythingUntil(strLimit))
  .map(r => ({
    type: "string",
    value: r
  }));
const betweenParenthesis = p.between(p.char("("))(p.char(")"));
const betweenCurlyBrackets = p.between(p.char("{"))(p.char("}"));

const objectNativeParser = p.choice(nativeObjs.map(s => p.str(s))).map(r => {
  return {
    type: "native-obj",
    value: r
  };
});

const objectNameParser = p
  .sequenceOf([
    p.letter,
    p.many(p.choice([p.letter, p.digits])).map(rs => rs.join(""))
  ])
  .map(rs => rs.join(""))
  .map(r => ({
    type: "obj-name",
    value: r
  }));

const objectAttributeParser = p
  .sequenceOf([
    p.letters,
    p.optionalWhitespace,
    p.str(":"),
    p.optionalWhitespace,
    p.choice([numParser, strParser])
  ])
  .map(rs => {
    return {
      name: rs[0],
      value: rs[4]
    };
  });

const objectAttributeListParser = betweenParenthesis(
  p.sepBy(
    p.sequenceOf([p.optionalWhitespace, p.char(","), p.optionalWhitespace])
  )(objectAttributeParser)
);

const objectChildrenParser = betweenCurlyBrackets(
  p.pipeParsers([
    p.everythingUntil(p.char("}")),
    p.recursiveParser(() => blockParser)
  ])
);

const objectParser = p
  .sequenceOf([
    p.choice([objectNativeParser, objectNameParser]),
    p.optionalWhitespace,
    objectAttributeListParser,
    p.optionalWhitespace,
    objectChildrenParser
  ])
  .map(rs => {
    return {
      type: "object",
      name: rs[0],
      attributes: rs[2],
      children: rs[4]
    };
  });

const objectDefinitionParser = p
  .sequenceOf([
    p.str("def"),
    p.whitespace,
    objectNameParser,
    p.optionalWhitespace,
    p.str("="),
    p.optionalWhitespace,
    objectParser
  ])
  .map(rs => {
    return {
      type: "command",
      value: "define-object",
      arguments: [rs[2], rs[6]]
    };
  });

const drawCommandParser = p
  .takeRight(p.sequenceOf([p.str("draw"), p.whitespace]))(objectParser)
  .map(r => {
    return {
      type: "command",
      value: "draw",
      arguments: [r]
    };
  });

const blockParser = p.many(
  p.choice([drawCommandParser, objectDefinitionParser, p.skip(p.whitespace)])
);

module.exports = { artParser: blockParser };
