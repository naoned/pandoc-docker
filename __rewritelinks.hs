#!/usr/bin/env runhaskell
-- rewritewikilinks.hs
import Text.Pandoc.JSON
import Data.Char

main = toJSONFilter rewritewikilinks

rewritewikilinks :: Inline -> [Inline]
rewritewikilinks ( Link attr txt ('#':url,title) ) = [ ( Link attr txt ("#"++url,title) ) ]
rewritewikilinks ( Link attr txt ('h':'t':'t':'p':':':url,title) ) = [ ( Link attr txt ("http:"++url,title) ) ]
rewritewikilinks ( Link attr txt ('h':'t':'t':'p':'s':':':url,title) ) = [ ( Link attr txt ("https:"++url,title) ) ]
rewritewikilinks ( Link attr txt (url,title) ) = [ ( Link attr txt ("#" ++ map toLower url,title) ) ]
rewritewikilinks x = [x]
