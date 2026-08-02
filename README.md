# Демо-сайты салонов — Narodniy Team

**Живой узел → [demo.narodniy-team.ru](https://demo.narodniy-team.ru/)**

Один домен на все демо, чтобы ссылки в переписке с клиентом выглядели коротко:

| Студия | Ссылка | Исходники |
|---|---|---|
| Arlett, Воронеж | [demo.narodniy-team.ru/arlett](https://demo.narodniy-team.ru/arlett/) | [arlett-demo](https://github.com/bmxer32/arlett-demo) |
| Atelier Volos, Сочи | [demo.narodniy-team.ru/atelier](https://demo.narodniy-team.ru/atelier/) | [atelier-volos-demo](https://github.com/bmxer32/atelier-volos-demo) |
| KOKO Studio, Москва | [demo.narodniy-team.ru/koko](https://demo.narodniy-team.ru/koko/) | [koko-studio-demo](https://github.com/bmxer32/koko-studio-demo) |

## Как это устроено

Это витрина, а не место разработки. Каждый сайт живёт в своём репозитории —
там же лежат сбор данных, проверки и README с разделом «что уточнить у клиента».
Сюда копируется только то, что отдаётся браузеру.

```
node sync.mjs
```

Скрипт берёт из `c:/autosait/clients/<проект>` разметку, стили, скрипты
и сжатые фотографии, кладёт в папку домена и печатает вес каждого сайта.
Оригиналы фотографий и служебные скрипты не копируются.

После правок в проекте — прогнать `sync.mjs`, закоммитить и запушить.
Ссылки на `bmxer32.github.io/<проект>-demo/` продолжают работать: узел их не заменяет.

## Домен

`CNAME` в корне указывает на `demo.narodniy-team.ru`.
Со стороны DNS нужна одна запись:

```
CNAME   demo   →   bmxer32.github.io
```
