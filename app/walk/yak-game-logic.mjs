export const PUZZLES=[
 {word:'ГИРЛЯНДА',title:'Вернуть праздничный свет',clue:'Как называется цепочка маленьких огней, которую декоратор развесил между ёлкой и игровым табло?',hint:'Это украшение включают в розетку; его лампочки соединены одним проводом.',prop:'light',propName:'Световой пульт',chapter:'СВЕТ',reaction:'На площадке зажглись праздничные огни.'},
 {word:'СУФЛЕР',title:'Вернуть ведущему текст',clue:'Кто незаметно подсказывает актёру забытые слова? В телевидении так называют и экран, с которого ведущий читает текст.',hint:'Слово начинается на «СУ». Буква Ё на табло записывается как Е.',prop:'script',propName:'Режиссёрская папка',chapter:'ГОЛОС',reaction:'Текст вернулся на экран. Студия готова к последней репетиции.'},
 {word:'КУРАНТЫ',title:'Поймать момент полуночи',clue:'Как называются башенные часы, чей бой в новогоднюю ночь отсчитывает двенадцать ударов?',hint:'В новогоднем эфире их показывают на Спасской башне Кремля.',prop:'clock',propName:'Эфирные часы',chapter:'ПОЛНОЧЬ',reaction:'Есть сигнал! Новогодняя студия снова в эфире.'}
];
export const SECTORS=[100,200,300,400,500,600,700,800,900,1000,500,200];
export const normalize=s=>s.trim().toUpperCase().replaceAll('Ё','Е');
export function initialRound(index=0){return{index:index%PUZZLES.length,phase:'ready',guessed:[],mistakes:0,score:0,sector:0,hinted:false,message:'Назовите слово сразу или вращайте колесо, чтобы открыть буквы.'}}
export function reduceRound(s,a){
 const word=PUZZLES[s.index].word;
 if(a.type==='new'&&s.phase==='won')return initialRound(s.index+1);
 if(a.type==='retry'&&s.phase==='lost')return initialRound(s.index);
 if(a.type==='hint'&&['ready','letter'].includes(s.phase)&&!s.hinted){const letter=[...word].find(l=>!s.guessed.includes(l));if(!letter)return s;const guessed=[...s.guessed,letter],won=[...word].every(l=>guessed.includes(l));return{...s,guessed,hinted:true,phase:won?'won':s.phase,message:`Реквизит помог: открыта буква ${letter}.`}}
 if(a.type==='spin'&&s.phase==='ready')return{...s,phase:'spinning',sector:Math.max(0,Math.min(11,a.sector)),message:'Колесо вращается…'};
 if(a.type==='settle'&&s.phase==='spinning')return{...s,phase:'letter',message:`Сектор ${SECTORS[s.sector]}. Выберите букву — каждое совпадение принесёт столько очков.`};
 if(a.type==='letter'&&s.phase==='letter'){
 const letter=normalize(a.letter);if(!/^[А-Я]$/.test(letter)||s.guessed.includes(letter))return s;
 const guessed=[...s.guessed,letter],count=[...word].filter(c=>c===letter).length,mistakes=s.mistakes+(count?0:1),score=s.score+count*SECTORS[s.sector];
 const won=[...word].every(c=>guessed.includes(c));return{...s,guessed,mistakes,score,phase:won?'won':mistakes>=6?'lost':'ready',message:won?'Слово открыто!':count?`Есть такая буква! Открыто: ${count}. +${count*SECTORS[s.sector]} очков раунда.`:'Такой буквы нет. Попробуйте другую или осмотрите реквизит.'};
 }
 if(a.type==='solve'&&['ready','letter'].includes(s.phase)){
 if(!normalize(a.word))return s;const won=normalize(a.word)===word,mistakes=s.mistakes+(won?0:1);
 return{...s,mistakes,score:won?s.score+Math.max(100,600-s.mistakes*100-(s.hinted?200:0)):s.score,phase:won?'won':mistakes>=6?'lost':'ready',guessed:won?[...new Set(word)]:s.guessed,message:won?'Верно! Задача решена.':'Не совпало. Потрачена одна из шести попыток.'};
 }
 return s;
}
