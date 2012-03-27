require 'ruble'

bundle do |bundle|
  bundle.display_name = 'TiShadow'
  bundle.author = 'David Bankier (@davidbankier)'
  bundle.copyright = <<END
(c) Copyright 2011 YY Digital Pty Ltd.
See https://github.com/dbankier/TiShadow/blob/master/LICENSE 
END

  bundle.description = <<END
Sample description
END
  bundle.menu 'TiShadowLaunch' do |menu|
    menu.menu 'Run' do |sub_menu|
        sub_menu.command 'Full TiShadow Build'
        sub_menu.command 'TiShadow Build Update'
    end
    menu.separator
    menu.command 'Open TiShadow Webpage'
  end
end